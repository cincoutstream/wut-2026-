package request

type CreateTransactionRequest struct {
	Remark string `json:"remark" binding:"max=500"`
}
