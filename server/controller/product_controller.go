package controller

import (
	"strconv"

	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type ProductController struct{}

func (p *ProductController) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	var req request.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	product, err := service.CreateProduct(userID, req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "商品发布成功", product)
}

func (p *ProductController) Update(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, _ := strconv.Atoi(c.Param("productId"))
	var req request.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	product, err := service.UpdateProduct(userID, uint(productID), req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "商品更新成功", product)
}

func (p *ProductController) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	data, err := service.ListProducts(c.Query("keyword"), c.Query("category"), c.Query("status"), page, pageSize)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", data)
}

func (p *ProductController) Detail(c *gin.Context) {
	productID, _ := strconv.Atoi(c.Param("productId"))
	product, err := service.GetProductByID(uint(productID))
	if err != nil {
		response.Fail(c, 404, err.Error())
		return
	}
	response.Success(c, "查询成功", product)
}

func (p *ProductController) MyProducts(c *gin.Context) {
	userID := c.GetUint("userID")
	products, err := service.ListMyProducts(userID)
	if err != nil {
		response.Fail(c, 500, err.Error())
		return
	}
	response.Success(c, "查询成功", products)
}

func (p *ProductController) OffShelf(c *gin.Context) {
	userID := c.GetUint("userID")
	productID, _ := strconv.Atoi(c.Param("productId"))
	product, err := service.OffShelfProduct(userID, uint(productID))
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "商品已下架", product)
}
