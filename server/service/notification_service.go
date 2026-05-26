package service

import (
	"errors"
	"fmt"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"

	"gorm.io/gorm"
)

type NotificationSummary struct {
	List        []model.Notification `json:"list"`
	UnreadCount int64                `json:"unreadCount"`
}

func CreateNotification(userID uint, notificationType model.NotificationType, title, content, targetPath string, transaction *model.Transaction) error {
	if userID == 0 || title == "" {
		return nil
	}

	notification := &model.Notification{
		UserID:     userID,
		Type:       notificationType,
		Title:      title,
		Content:    content,
		TargetPath: targetPath,
	}
	if transaction != nil {
		notification.TransactionID = transaction.ID
		notification.ProductID = transaction.ProductID
	}
	return database.DB.Create(notification).Error
}

func NotifyTransactionCreated(transaction *model.Transaction) error {
	if transaction == nil {
		return nil
	}
	productTitle := transaction.Product.Title
	buyerName := displayUserName(transaction.Buyer)
	return CreateNotification(
		transaction.SellerID,
		model.NotificationTransactionCreated,
		"你有新的交易申请",
		fmt.Sprintf("%s 想购买「%s」，请及时查看并处理。", buyerName, productTitle),
		"/my/sell-transactions",
		transaction,
	)
}

func NotifyTransactionStatusChanged(transaction *model.Transaction, actorID uint, notificationType model.NotificationType) error {
	if transaction == nil {
		return nil
	}

	targetUserID := transaction.BuyerID
	if actorID == transaction.BuyerID {
		targetUserID = transaction.SellerID
	}
	if targetUserID == 0 || targetUserID == actorID {
		return nil
	}

	title := "交易状态有更新"
	content := fmt.Sprintf("「%s」的交易状态已更新，请查看交易记录。", transaction.Product.Title)
	targetPath := "/my/buy-transactions"
	switch notificationType {
	case model.NotificationTransactionAccepted:
		title = "交易申请已被接受"
		content = fmt.Sprintf("卖家已接受「%s」的交易申请，请按约定线下面交。", transaction.Product.Title)
	case model.NotificationTransactionRejected:
		title = "交易申请已被拒绝"
		content = fmt.Sprintf("「%s」的交易申请已被拒绝，可以继续看看其他商品。", transaction.Product.Title)
	case model.NotificationTransactionCompleted:
		title = "交易已完成"
		content = fmt.Sprintf("「%s」的交易已完成，可以去发表或修改评价。", transaction.Product.Title)
		if targetUserID == transaction.SellerID {
			targetPath = "/my/sell-transactions"
		}
	}

	return CreateNotification(targetUserID, notificationType, title, content, targetPath, transaction)
}

func ListNotifications(userID uint) (*NotificationSummary, error) {
	var notifications []model.Notification
	if err := database.DB.
		Where("user_id = ?", userID).
		Order("is_read asc, created_at desc").
		Limit(50).
		Find(&notifications).Error; err != nil {
		return nil, err
	}

	unreadCount, err := CountUnreadNotifications(userID)
	if err != nil {
		return nil, err
	}

	return &NotificationSummary{
		List:        notifications,
		UnreadCount: unreadCount,
	}, nil
}

func CountUnreadNotifications(userID uint) (int64, error) {
	var count int64
	err := database.DB.Model(&model.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error
	return count, err
}

func MarkNotificationRead(userID, notificationID uint) (*model.Notification, error) {
	var notification model.Notification
	if err := database.DB.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("通知不存在")
		}
		return nil, err
	}
	if notification.IsRead {
		return &notification, nil
	}
	notification.IsRead = true
	if err := database.DB.Save(&notification).Error; err != nil {
		return nil, err
	}
	return &notification, nil
}

func MarkAllNotificationsRead(userID uint) error {
	return database.DB.Model(&model.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error
}

func displayUserName(user model.User) string {
	if user.Nickname != "" {
		return user.Nickname
	}
	if user.Username != "" {
		return user.Username
	}
	return "买家"
}
