package request

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=50"`
	Nickname string `json:"nickname" binding:"max=50"`
	Phone    string `json:"phone" binding:"required,len=11,numeric"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}
