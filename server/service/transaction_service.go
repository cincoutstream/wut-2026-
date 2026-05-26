package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"

	"gorm.io/gorm"
)

func CreateTransaction(userID, productID uint, req request.CreateTransactionRequest) (*model.Transaction, error) {
	req.Remark = strings.TrimSpace(req.Remark)
	if req.Remark == "" {
		return nil, errors.New("请填写交易时间、地点或联系方式说明")
	}

	product, err := GetProductByID(productID)
	if err != nil {
		return nil, err
	}
	if product.UserID == userID {
		return nil, errors.New("不能购买自己发布的商品")
	}
	if product.Status != model.ProductStatusAvailable {
		return nil, errors.New("当前商品不可交易")
	}

	buyer, err := GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(buyer.Phone) == "" {
		return nil, errors.New("请先在个人信息填写手机号，方便卖家联系你")
	}

	var existing model.Transaction
	if err := database.DB.Where("product_id = ? AND buyer_id = ? AND status IN ?", productID, userID, []string{"pending", "accepted"}).First(&existing).Error; err == nil {
		return nil, errors.New("你已经申请过该商品交易")
	}

	transaction := &model.Transaction{
		ProductID: productID,
		BuyerID:   userID,
		SellerID:  product.UserID,
		Remark:    req.Remark,
		Status:    model.TransactionPending,
	}
	if err := database.DB.Create(transaction).Error; err != nil {
		return nil, err
	}
	createdTransaction, err := GetTransactionByID(transaction.ID)
	if err != nil {
		return nil, err
	}
	_ = NotifyTransactionCreated(createdTransaction)
	return createdTransaction, nil
}

func GetTransactionByID(id uint) (*model.Transaction, error) {
	var transaction model.Transaction
	if err := database.DB.Preload("Product").Preload("Buyer").Preload("Seller").First(&transaction, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("交易记录不存在")
		}
		return nil, err
	}
	return &transaction, nil
}

func ListBuyTransactions(userID uint) ([]model.Transaction, error) {
	var transactions []model.Transaction
	err := database.DB.Preload("Product").Preload("Buyer").Preload("Seller").Where("buyer_id = ?", userID).Order("created_at desc").Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	transactions, err = attachReviewStatus(transactions, userID)
	if err != nil {
		return nil, err
	}
	return attachTransactionUserRatings(transactions)
}

func ListSellTransactions(userID uint) ([]model.Transaction, error) {
	var transactions []model.Transaction
	err := database.DB.Preload("Product").Preload("Buyer").Preload("Seller").Where("seller_id = ?", userID).Order("created_at desc").Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	transactions, err = attachReviewStatus(transactions, userID)
	if err != nil {
		return nil, err
	}
	return attachTransactionUserRatings(transactions)
}

func attachReviewStatus(transactions []model.Transaction, userID uint) ([]model.Transaction, error) {
	if len(transactions) == 0 {
		return transactions, nil
	}

	transactionIDs := make([]uint, 0, len(transactions))
	for _, transaction := range transactions {
		transactionIDs = append(transactionIDs, transaction.ID)
	}

	var reviews []model.Review
	if err := database.DB.
		Preload("Reviewer").
		Preload("TargetUser").
		Where("transaction_id IN ?", transactionIDs).
		Find(&reviews).Error; err != nil {
		return nil, err
	}

	for index := range transactions {
		for reviewIndex := range reviews {
			review := reviews[reviewIndex]
			if review.TransactionID != transactions[index].ID {
				continue
			}
			if review.ReviewerID == userID {
				transactions[index].MyReview = &reviews[reviewIndex]
			} else {
				transactions[index].PeerReview = &reviews[reviewIndex]
			}
		}
	}

	return transactions, nil
}

func attachTransactionUserRatings(transactions []model.Transaction) ([]model.Transaction, error) {
	if len(transactions) == 0 {
		return transactions, nil
	}

	userIDSet := make(map[uint]struct{})
	userIDs := make([]uint, 0, len(transactions)*2)
	addUserID := func(id uint) {
		if id == 0 {
			return
		}
		if _, ok := userIDSet[id]; ok {
			return
		}
		userIDSet[id] = struct{}{}
		userIDs = append(userIDs, id)
	}

	for _, transaction := range transactions {
		addUserID(transaction.Buyer.ID)
		addUserID(transaction.Seller.ID)
	}
	if len(userIDs) == 0 {
		return transactions, nil
	}

	type ratingStat struct {
		UserID uint
		Avg    float64
		Count  int64
	}

	var stats []ratingStat
	if err := database.DB.Model(&model.Review{}).
		Select("target_user_id AS user_id, COALESCE(AVG(rating), 0) AS avg, COUNT(*) AS count").
		Where("target_user_id IN ?", userIDs).
		Group("target_user_id").
		Scan(&stats).Error; err != nil {
		return nil, err
	}

	statMap := make(map[uint]ratingStat, len(stats))
	for _, stat := range stats {
		statMap[stat.UserID] = stat
	}

	for index := range transactions {
		if stat, ok := statMap[transactions[index].Buyer.ID]; ok {
			transactions[index].Buyer.RatingAvg = stat.Avg
			transactions[index].Buyer.RatingCount = stat.Count
		}
		if stat, ok := statMap[transactions[index].Seller.ID]; ok {
			transactions[index].Seller.RatingAvg = stat.Avg
			transactions[index].Seller.RatingCount = stat.Count
		}
	}

	return transactions, nil
}

func AcceptTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.SellerID != userID {
		return nil, errors.New("只有卖家可以接受交易")
	}
	if transaction.Status != model.TransactionPending {
		return nil, errors.New("当前交易状态不可接受")
	}

	updatedTransaction, err := updateTransactionStatus(transaction, model.TransactionAccepted, model.ProductStatusTrading)
	if err != nil {
		return nil, err
	}
	_ = NotifyTransactionStatusChanged(updatedTransaction, userID, model.NotificationTransactionAccepted)
	return updatedTransaction, nil
}

func RejectTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.SellerID != userID {
		return nil, errors.New("只有卖家可以拒绝交易")
	}
	if transaction.Status != model.TransactionPending {
		return nil, errors.New("当前交易状态不可拒绝")
	}

	tx := database.DB.Begin()
	transaction.Status = model.TransactionRejected
	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	updatedTransaction, err := GetTransactionByID(transaction.ID)
	if err != nil {
		return nil, err
	}
	_ = NotifyTransactionStatusChanged(updatedTransaction, userID, model.NotificationTransactionRejected)
	return updatedTransaction, nil
}

func CompleteTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.BuyerID != userID && transaction.SellerID != userID {
		return nil, errors.New("只有交易相关用户可以完成交易")
	}
	if transaction.Status != model.TransactionAccepted {
		return nil, errors.New("当前交易状态不可完成")
	}

	updatedTransaction, err := updateTransactionStatus(transaction, model.TransactionCompleted, model.ProductStatusSold)
	if err != nil {
		return nil, err
	}
	_ = NotifyTransactionStatusChanged(updatedTransaction, userID, model.NotificationTransactionCompleted)
	return updatedTransaction, nil
}

func updateTransactionStatus(transaction *model.Transaction, tStatus model.TransactionStatus, pStatus model.ProductStatus) (*model.Transaction, error) {
	tx := database.DB.Begin()
	transaction.Status = tStatus
	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Model(&model.Product{}).Where("id = ?", transaction.ProductID).Update("status", pStatus).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return GetTransactionByID(transaction.ID)
}
