package service

import (
	"errors"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"

	"gorm.io/gorm"
)

type UserReviewSummary struct {
	UserID      uint           `json:"userId"`
	RatingAvg   float64        `json:"ratingAvg"`
	RatingCount int64          `json:"ratingCount"`
	Reviews     []model.Review `json:"reviews"`
}

func CreateReview(userID, transactionID uint, req request.CreateReviewRequest) (*model.Review, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.Status != model.TransactionCompleted {
		return nil, errors.New("只有已完成的交易才能评价")
	}
	if transaction.BuyerID != userID && transaction.SellerID != userID {
		return nil, errors.New("只有交易相关用户可以评价")
	}

	var existing model.Review
	if err := database.DB.Where("transaction_id = ? AND reviewer_id = ?", transactionID, userID).First(&existing).Error; err == nil {
		return nil, errors.New("同一交易只能评价一次")
	}

	targetUserID := transaction.SellerID
	if userID == transaction.SellerID {
		targetUserID = transaction.BuyerID
	}

	review := &model.Review{
		TransactionID: transactionID,
		ProductID:     transaction.ProductID,
		ReviewerID:    userID,
		TargetUserID:  targetUserID,
		Rating:        req.Rating,
		Content:       req.Content,
	}
	if err := database.DB.Create(review).Error; err != nil {
		return nil, err
	}
	return GetReviewByID(review.ID)
}

func GetReviewByID(reviewID uint) (*model.Review, error) {
	var review model.Review
	if err := database.DB.Preload("Reviewer").Preload("TargetUser").Preload("Product").First(&review, reviewID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("评价不存在")
		}
		return nil, err
	}
	return &review, nil
}

func ListReviews(productID uint) ([]model.Review, error) {
	var reviews []model.Review
	err := database.DB.Preload("Reviewer").Preload("TargetUser").Where("product_id = ?", productID).Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func UpdateReview(userID, reviewID uint, req request.UpdateReviewRequest) (*model.Review, error) {
	review, err := GetReviewByID(reviewID)
	if err != nil {
		return nil, err
	}
	if review.ReviewerID != userID {
		return nil, errors.New("只能修改自己的评价")
	}
	review.Rating = req.Rating
	review.Content = req.Content
	if err := database.DB.Save(review).Error; err != nil {
		return nil, err
	}
	return GetReviewByID(reviewID)
}

func GetUserRatingStats(userID uint) (float64, int64, error) {
	type result struct {
		Avg   float64
		Count int64
	}

	var stats result
	if err := database.DB.Model(&model.Review{}).
		Select("COALESCE(AVG(rating), 0) as avg, COUNT(*) as count").
		Where("target_user_id = ?", userID).
		Scan(&stats).Error; err != nil {
		return 0, 0, err
	}
	return stats.Avg, stats.Count, nil
}

func ListUserReviews(userID uint) (*UserReviewSummary, error) {
	var reviews []model.Review
	if err := database.DB.Preload("Reviewer").Preload("Product").Where("target_user_id = ?", userID).Order("created_at desc").Find(&reviews).Error; err != nil {
		return nil, err
	}

	avg, count, err := GetUserRatingStats(userID)
	if err != nil {
		return nil, err
	}

	return &UserReviewSummary{
		UserID:      userID,
		RatingAvg:   avg,
		RatingCount: count,
		Reviews:     reviews,
	}, nil
}
