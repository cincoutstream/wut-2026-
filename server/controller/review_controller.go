package controller

import (
	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type ReviewController struct{}

func (r *ReviewController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID, ok := parsePositiveID(c, "transactionId")
	if !ok {
		return
	}
	var req request.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}
	review, err := service.CreateReview(userID, transactionID, req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "评价成功", review)
}

func (r *ReviewController) ListByProduct(c *gin.Context) {
	productID, ok := parsePositiveID(c, "productId")
	if !ok {
		return
	}
	reviews, err := service.ListReviews(productID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", reviews)
}

func (r *ReviewController) ListByUser(c *gin.Context) {
	userID, ok := parsePositiveID(c, "userId")
	if !ok {
		return
	}
	summary, err := service.ListUserReviews(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", summary)
}

func (r *ReviewController) Update(c *gin.Context) {
	userID := c.GetUint("userID")
	reviewID, ok := parsePositiveID(c, "reviewId")
	if !ok {
		return
	}
	var req request.UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}
	review, err := service.UpdateReview(userID, reviewID, req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "评价更新成功", review)
}
