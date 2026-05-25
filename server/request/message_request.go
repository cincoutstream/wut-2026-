package request

type CreateMessageRequest struct {
	Content string `json:"content" binding:"required,max=500"`
}
