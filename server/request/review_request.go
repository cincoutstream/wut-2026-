package request

type CreateReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Content string `json:"content" binding:"required,max=500"`
}

type UpdateReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Content string `json:"content" binding:"required,max=500"`
}

type UpdateProfileRequest struct {
	Nickname string `json:"nickname" binding:"max=50"`
	Phone    string `json:"phone" binding:"required,len=11,numeric"`
	Avatar   string `json:"avatar" binding:"max=255"`
}
