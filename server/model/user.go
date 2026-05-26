package model

import "time"

type User struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Username    string    `json:"username" gorm:"size:50;uniqueIndex;not null"`
	Password    string    `json:"-" gorm:"size:255;not null"`
	Nickname    string    `json:"nickname" gorm:"size:50"`
	Phone       string    `json:"phone" gorm:"size:20"`
	QQ          string    `json:"qq" gorm:"size:30"`
	Wechat      string    `json:"wechat" gorm:"size:80"`
	Avatar      string    `json:"avatar" gorm:"type:longtext"`
	Role        string    `json:"role" gorm:"size:20;default:user"`
	RatingAvg   float64   `json:"ratingAvg" gorm:"-"`
	RatingCount int64     `json:"ratingCount" gorm:"-"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
