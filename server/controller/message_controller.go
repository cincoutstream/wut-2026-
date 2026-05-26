package controller

import (
	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type MessageController struct{}

func (m *MessageController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, ok := parsePositiveID(c, "productId")
	if !ok {
		return
	}
	var req request.CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}
	message, err := service.CreateMessage(userID, productID, req, nil)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "留言成功", message)
}

func (m *MessageController) Reply(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, ok := parsePositiveID(c, "productId")
	if !ok {
		return
	}
	messageID, ok := parsePositiveID(c, "messageId")
	if !ok {
		return
	}
	var req request.CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}
	parentID := messageID
	message, err := service.CreateMessage(userID, productID, req, &parentID)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "回复成功", message)
}

func (m *MessageController) List(c *gin.Context) {
	productID, ok := parsePositiveID(c, "productId")
	if !ok {
		return
	}
	messages, err := service.ListMessages(productID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", messages)
}

func (m *MessageController) Delete(c *gin.Context) {
	userID := c.GetUint("userID")
	messageID, ok := parsePositiveID(c, "messageId")
	if !ok {
		return
	}
	if err := service.DeleteMessage(userID, messageID); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "删除成功", nil)
}
