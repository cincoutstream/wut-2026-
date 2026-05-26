package controller

import (
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type NotificationController struct{}

func (n *NotificationController) List(c *gin.Context) {
	userID := c.GetUint("userID")
	notifications, err := service.ListNotifications(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", notifications)
}

func (n *NotificationController) Count(c *gin.Context) {
	userID := c.GetUint("userID")
	count, err := service.CountUnreadNotifications(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", gin.H{"unreadCount": count})
}

func (n *NotificationController) MarkRead(c *gin.Context) {
	userID := c.GetUint("userID")
	notificationID, ok := parsePositiveID(c, "notificationId")
	if !ok {
		return
	}
	notification, err := service.MarkNotificationRead(userID, notificationID)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "已读成功", notification)
}

func (n *NotificationController) MarkAllRead(c *gin.Context) {
	userID := c.GetUint("userID")
	if err := service.MarkAllNotificationsRead(userID); err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "已全部标记为已读", nil)
}
