package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"

	"gorm.io/gorm"
)

func CreateTransaction(userID, productID uint, req request.CreateTransactionRequest) (*model.Transaction, error) {
	req.Remark = strings.TrimSpace(req.Remark)
	if req.Remark == "" {
		return nil, errors.New("请填写交易时间、地点或联系方式说明")
	}

	product, err := GetProductByID(productID)
	if err != nil {
		return nil, err
	}
	if product.UserID == userID {
		return nil, errors.New("不能购买自己发布的商品")
	}
	if product.Status != model.ProductStatusAvailable {
		return nil, errors.New("当前商品不可交易")
	}

	buyer, err := GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(buyer.Phone) == "" {
		return nil, errors.New("请先在个人信息填写手机号，方便卖家联系你")
	}

	var existing model.Transaction
	if err := database.DB.Where("product_id = ? AND buyer_id = ? AND status IN ?", productID, userID, []string{"pending", "accepted"}).First(&existing).Error; err == nil {
		return nil, errors.New("你已经申请过该商品交易")
	}

	transaction := &model.Transaction{
		ProductID: productID,
		BuyerID:   userID,
		SellerID:  product.UserID,
		Remark:    req.Remark,
		Status:    model.TransactionPending,
	}
	if err := database.DB.Create(transaction).Error; err != nil {
		return nil, err
	}
	return GetTransactionByID(transaction.ID)
}

func GetTransactionByID(id uint) (*model.Transaction, error) {
	var transaction model.Transaction
	if err := database.DB.Preload("Product").Preload("Buyer").Preload("Seller").First(&transaction, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("交易记录不存在")
		}
		return nil, err
	}
	return &transaction, nil
}

func ListBuyTransactions(userID uint) ([]model.Transaction, error) {
	var transactions []model.Transaction
	err := database.DB.Preload("Product").Preload("Seller").Where("buyer_id = ?", userID).Order("created_at desc").Find(&transactions).Error
	return transactions, err
}

func ListSellTransactions(userID uint) ([]model.Transaction, error) {
	var transactions []model.Transaction
	err := database.DB.Preload("Product").Preload("Buyer").Where("seller_id = ?", userID).Order("created_at desc").Find(&transactions).Error
	return transactions, err
}

func AcceptTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.SellerID != userID {
		return nil, errors.New("只有卖家可以接受交易")
	}
	if transaction.Status != model.TransactionPending {
		return nil, errors.New("当前交易状态不可接受")
	}

	return updateTransactionStatus(transaction, model.TransactionAccepted, model.ProductStatusTrading)
}

func RejectTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.SellerID != userID {
		return nil, errors.New("只有卖家可以拒绝交易")
	}
	if transaction.Status != model.TransactionPending {
		return nil, errors.New("当前交易状态不可拒绝")
	}

	tx := database.DB.Begin()
	transaction.Status = model.TransactionRejected
	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return GetTransactionByID(transaction.ID)
}

func CompleteTransaction(userID, transactionID uint) (*model.Transaction, error) {
	transaction, err := GetTransactionByID(transactionID)
	if err != nil {
		return nil, err
	}
	if transaction.BuyerID != userID && transaction.SellerID != userID {
		return nil, errors.New("只有交易相关用户可以完成交易")
	}
	if transaction.Status != model.TransactionAccepted {
		return nil, errors.New("当前交易状态不可完成")
	}

	return updateTransactionStatus(transaction, model.TransactionCompleted, model.ProductStatusSold)
}

func updateTransactionStatus(transaction *model.Transaction, tStatus model.TransactionStatus, pStatus model.ProductStatus) (*model.Transaction, error) {
	tx := database.DB.Begin()
	transaction.Status = tStatus
	if err := tx.Save(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Model(&model.Product{}).Where("id = ?", transaction.ProductID).Update("status", pStatus).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return GetTransactionByID(transaction.ID)
}
