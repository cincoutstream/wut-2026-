package request

type CreateReviewRequest struct {
	Rating   int    `json:"rating" binding:"required,min=1,max=5"`
	Content  string `json:"content" binding:"required,max=500"`
	ImageURL string `json:"imageUrl" binding:"max=500000"`
}

type UpdateReviewRequest struct {
	Rating   int    `json:"rating" binding:"required,min=1,max=5"`
	Content  string `json:"content" binding:"required,max=500"`
	ImageURL string `json:"imageUrl" binding:"max=500000"`
}

type UpdateProfileRequest struct {
	Nickname string `json:"nickname" binding:"max=50"`
	Phone    string `json:"phone" binding:"required,len=11,numeric"`
	QQ       string `json:"qq" binding:"max=30"`
	Wechat   string `json:"wechat" binding:"max=80"`
	Avatar   string `json:"avatar" binding:"max=500000"`
}
