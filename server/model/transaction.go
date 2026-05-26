package model

import "time"

type TransactionStatus string

const (
	TransactionPending   TransactionStatus = "pending"
	TransactionAccepted  TransactionStatus = "accepted"
	TransactionRejected  TransactionStatus = "rejected"
	TransactionCompleted TransactionStatus = "completed"
	TransactionCancelled TransactionStatus = "cancelled"
)

type Transaction struct {
	ID         uint              `json:"id" gorm:"primaryKey"`
	ProductID  uint              `json:"productId" gorm:"not null;index"`
	Product    Product           `json:"product"`
	BuyerID    uint              `json:"buyerId" gorm:"not null;index"`
	Buyer      User              `json:"buyer"`
	SellerID   uint              `json:"sellerId" gorm:"not null;index"`
	Seller     User              `json:"seller"`
	Remark     string            `json:"remark" gorm:"type:text"`
	Status     TransactionStatus `json:"status" gorm:"size:20;default:pending"`
	MyReview   *Review           `json:"myReview,omitempty" gorm:"-"`
	PeerReview *Review           `json:"peerReview,omitempty" gorm:"-"`
	CreatedAt  time.Time         `json:"createdAt"`
	UpdatedAt  time.Time         `json:"updatedAt"`
}
