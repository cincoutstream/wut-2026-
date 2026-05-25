package model

import "time"

type Message struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"productId" gorm:"not null;index"`
	UserID    uint      `json:"userId" gorm:"not null;index"`
	User      User      `json:"user"`
	ParentID  *uint     `json:"parentId" gorm:"index"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	IsDeleted bool      `json:"isDeleted" gorm:"default:false"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
