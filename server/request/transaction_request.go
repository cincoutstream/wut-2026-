package request

type CreateTransactionRequest struct {
	Remark string `json:"remark" binding:"required,max=500"`
}
