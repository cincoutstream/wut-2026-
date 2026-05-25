package controller

import (
	"strconv"

	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type MessageController struct{}

func (m *MessageController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, _ := strconv.Atoi(c.Param("productId"))
	var req request.CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	message, err := service.CreateMessage(userID, uint(productID), req.Content, nil)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "留言成功", message)
}

func (m *MessageController) Reply(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, _ := strconv.Atoi(c.Param("productId"))
	messageID, _ := strconv.Atoi(c.Param("messageId"))
	var req request.CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	parentID := uint(messageID)
	message, err := service.CreateMessage(userID, uint(productID), req.Content, &parentID)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "回复成功", message)
}

func (m *MessageController) List(c *gin.Context) {
	productID, _ := strconv.Atoi(c.Param("productId"))
	messages, err := service.ListMessages(uint(productID))
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", messages)
}

func (m *MessageController) Delete(c *gin.Context) {
	userID := c.GetUint("userID")
	messageID, _ := strconv.Atoi(c.Param("messageId"))
	if err := service.DeleteMessage(userID, uint(messageID)); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "删除成功", nil)
}
