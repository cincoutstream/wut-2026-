package response

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func JSON(c *gin.Context, httpStatus int, code int, message string, data interface{}) {
	if startValue, ok := c.Get("requestStart"); ok {
		if start, ok := startValue.(time.Time); ok {
			c.Header("X-Response-Time", fmt.Sprintf("%.2fms", float64(time.Since(start).Microseconds())/1000))
		}
	}
	c.JSON(httpStatus, APIResponse{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func Success(c *gin.Context, message string, data interface{}) {
	JSON(c, 200, 200, message, data)
}

func Fail(c *gin.Context, httpStatus int, message string) {
	JSON(c, httpStatus, httpStatus, message, nil)
}
