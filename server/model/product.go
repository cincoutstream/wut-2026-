package model

import "time"

type ProductStatus string

const (
	ProductStatusAvailable ProductStatus = "available"
	ProductStatusTrading   ProductStatus = "trading"
	ProductStatusSold      ProductStatus = "sold"
	ProductStatusOffShelf  ProductStatus = "off_shelf"
)

type Product struct {
	ID          uint          `json:"id" gorm:"primaryKey"`
	UserID      uint          `json:"userId" gorm:"not null;index"`
	User        User          `json:"user"`
	Title       string        `json:"title" gorm:"size:100;not null"`
	Description string        `json:"description" gorm:"type:text"`
	Price       float64       `json:"price" gorm:"type:decimal(10,2);not null"`
	Category    string        `json:"category" gorm:"size:50"`
	ImageURL    string        `json:"imageUrl" gorm:"type:longtext"`
	Status      ProductStatus `json:"status" gorm:"size:20;default:available"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}
