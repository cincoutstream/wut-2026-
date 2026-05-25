package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"

	"gorm.io/gorm"
)

func CreateProduct(userID uint, req request.CreateProductRequest) (*model.Product, error) {
	product := &model.Product{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		ImageURL:    req.ImageURL,
		Status:      model.ProductStatusAvailable,
	}

	if err := database.DB.Create(product).Error; err != nil {
		return nil, err
	}

	return GetProductByID(product.ID)
}

func GetProductByID(productID uint) (*model.Product, error) {
	var product model.Product
	if err := database.DB.Preload("User").First(&product, productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("商品不存在")
		}
		return nil, err
	}
	if err := fillUserRating(&product.User); err != nil {
		return nil, err
	}
	return &product, nil
}

func UpdateProduct(userID, productID uint, req request.UpdateProductRequest) (*model.Product, error) {
	product, err := GetProductByID(productID)
	if err != nil {
		return nil, err
	}
	if product.UserID != userID {
		return nil, errors.New("只能修改自己的商品")
	}

	product.Title = req.Title
	product.Description = req.Description
	product.Price = req.Price
	product.Category = req.Category
	product.ImageURL = req.ImageURL
	product.Status = model.ProductStatus(req.Status)

	if err := database.DB.Save(product).Error; err != nil {
		return nil, err
	}

	return GetProductByID(productID)
}

func ListProducts(keyword, category, status string, page, pageSize int) (map[string]interface{}, error) {
	var (
		products []model.Product
		total    int64
	)

	query := database.DB.Model(&model.Product{}).Preload("User")

	if keyword != "" {
		like := "%" + strings.TrimSpace(keyword) + "%"
		query = query.Where("title LIKE ? OR description LIKE ?", like, like)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	if err := query.Order("created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&products).Error; err != nil {
		return nil, err
	}
	for index := range products {
		if err := fillUserRating(&products[index].User); err != nil {
			return nil, err
		}
	}

	return map[string]interface{}{
		"list":     products,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	}, nil
}

func ListMyProducts(userID uint) ([]model.Product, error) {
	var products []model.Product
	if err := database.DB.Preload("User").Where("user_id = ?", userID).Order("created_at desc").Find(&products).Error; err != nil {
		return nil, err
	}
	for index := range products {
		if err := fillUserRating(&products[index].User); err != nil {
			return nil, err
		}
	}
	return products, nil
}

func OffShelfProduct(userID, productID uint) (*model.Product, error) {
	product, err := GetProductByID(productID)
	if err != nil {
		return nil, err
	}
	if product.UserID != userID {
		return nil, errors.New("只能下架自己的商品")
	}
	product.Status = model.ProductStatusOffShelf
	if err := database.DB.Save(product).Error; err != nil {
		return nil, err
	}
	return GetProductByID(product.ID)
}

func fillUserRating(user *model.User) error {
	if user == nil || user.ID == 0 {
		return nil
	}
	avg, count, err := GetUserRatingStats(user.ID)
	if err != nil {
		return err
	}
	user.RatingAvg = avg
	user.RatingCount = count
	return nil
}
