package model

import "time"

type NotificationType string

const (
	NotificationTransactionCreated   NotificationType = "transaction_created"
	NotificationTransactionAccepted  NotificationType = "transaction_accepted"
	NotificationTransactionRejected  NotificationType = "transaction_rejected"
	NotificationTransactionCompleted NotificationType = "transaction_completed"
)

type Notification struct {
	ID            uint             `json:"id" gorm:"primaryKey"`
	UserID        uint             `json:"userId" gorm:"not null;index"`
	User          User             `json:"user"`
	TransactionID uint             `json:"transactionId" gorm:"index"`
	ProductID     uint             `json:"productId" gorm:"index"`
	Type          NotificationType `json:"type" gorm:"size:50;not null"`
	Title         string           `json:"title" gorm:"size:120;not null"`
	Content       string           `json:"content" gorm:"type:text"`
	TargetPath    string           `json:"targetPath" gorm:"size:120"`
	IsRead        bool             `json:"isRead" gorm:"default:false;index"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
}
