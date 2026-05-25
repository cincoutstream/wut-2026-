package request

type CreateProductRequest struct {
	Title       string  `json:"title" binding:"required,max=100"`
	Description string  `json:"description" binding:"max=2000"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"max=50"`
	ImageURL    string  `json:"imageUrl"`
}

type UpdateProductRequest struct {
	Title       string  `json:"title" binding:"required,max=100"`
	Description string  `json:"description" binding:"max=2000"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"max=50"`
	ImageURL    string  `json:"imageUrl"`
	Status      string  `json:"status" binding:"required,oneof=available trading sold off_shelf"`
}
