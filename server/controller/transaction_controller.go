package controller

import (
	"strconv"

	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type TransactionController struct{}

func (t *TransactionController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, _ := strconv.Atoi(c.Param("productId"))
	var req request.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	transaction, err := service.CreateTransaction(userID, uint(productID), req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "交易申请成功", transaction)
}

func (t *TransactionController) BuyList(c *gin.Context) {
	userID := c.GetUint("userID")
	transactions, err := service.ListBuyTransactions(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", transactions)
}

func (t *TransactionController) SellList(c *gin.Context) {
	userID := c.GetUint("userID")
	transactions, err := service.ListSellTransactions(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", transactions)
}

func (t *TransactionController) Accept(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID, _ := strconv.Atoi(c.Param("transactionId"))
	transaction, err := service.AcceptTransaction(userID, uint(transactionID))
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "已接受交易", transaction)
}

func (t *TransactionController) Reject(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID, _ := strconv.Atoi(c.Param("transactionId"))
	transaction, err := service.RejectTransaction(userID, uint(transactionID))
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "已拒绝交易", transaction)
}

func (t *TransactionController) Complete(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID, _ := strconv.Atoi(c.Param("transactionId"))
	transaction, err := service.CompleteTransaction(userID, uint(transactionID))
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "交易已完成", transaction)
}
