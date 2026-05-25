package controller

import (
	"strconv"

	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type ReviewController struct{}

func (r *ReviewController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID, _ := strconv.Atoi(c.Param("transactionId"))
	var req request.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	review, err := service.CreateReview(userID, uint(transactionID), req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "评价成功", review)
}

func (r *ReviewController) ListByProduct(c *gin.Context) {
	productID, _ := strconv.Atoi(c.Param("productId"))
	reviews, err := service.ListReviews(uint(productID))
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", reviews)
}

func (r *ReviewController) ListByUser(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Param("userId"))
	summary, err := service.ListUserReviews(uint(userID))
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", summary)
}

func (r *ReviewController) Update(c *gin.Context) {
	userID := c.GetUint("userID")
	reviewID, _ := strconv.Atoi(c.Param("reviewId"))
	var req request.UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	review, err := service.UpdateReview(userID, uint(reviewID), req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "评价更新成功", review)
}
