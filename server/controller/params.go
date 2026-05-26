package controller

import (
	"strconv"

	"campus-second-hand/server/response"

	"github.com/gin-gonic/gin"
)

const (
	defaultPageSize = 10
	maxPageSize     = 50
)

func parsePositiveID(c *gin.Context, name string) (uint, bool) {
	value, err := strconv.Atoi(c.Param(name))
	if err != nil || value <= 0 {
		response.Fail(c, 400, "请求路径参数不正确")
		return 0, false
	}
	return uint(value), true
}

func parsePagination(c *gin.Context) (int, int) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", strconv.Itoa(defaultPageSize)))
	if err != nil || pageSize < 1 {
		pageSize = defaultPageSize
	}
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}

	return page, pageSize
}
