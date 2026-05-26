package request

type CreateMessageRequest struct {
	Content  string `json:"content" binding:"required,max=500"`
	ImageURL string `json:"imageUrl" binding:"max=500000"`
}
