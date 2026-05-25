package response

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func JSON(c *gin.Context, httpStatus int, code int, message string, data interface{}) {
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
