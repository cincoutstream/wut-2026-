package model

import "time"

type Review struct {
	ID            uint        `json:"id" gorm:"primaryKey"`
	TransactionID uint        `json:"transactionId" gorm:"not null;index"`
	Transaction   Transaction `json:"transaction"`
	ProductID     uint        `json:"productId" gorm:"not null;index"`
	Product       Product     `json:"product"`
	ReviewerID    uint        `json:"reviewerId" gorm:"not null;index"`
	Reviewer      User        `json:"reviewer"`
	TargetUserID  uint        `json:"targetUserId" gorm:"not null;index"`
	TargetUser    User        `json:"targetUser"`
	Rating        int         `json:"rating" gorm:"not null"`
	Content       string      `json:"content" gorm:"type:text"`
	CreatedAt     time.Time   `json:"createdAt"`
	UpdatedAt     time.Time   `json:"updatedAt"`
}
