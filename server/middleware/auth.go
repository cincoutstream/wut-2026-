package middleware

import (
	"strings"

	"campus-second-hand/server/response"
	"campus-second-hand/server/utils"

	"github.com/gin-gonic/gin"
)

func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Fail(c, 401, "未登录或缺少 Token")
			c.Abort()
			return
		}

		tokenParts := strings.SplitN(authHeader, " ", 2)
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			response.Fail(c, 401, "Token 格式错误")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(secret, tokenParts[1])
		if err != nil {
			response.Fail(c, 401, "Token 无效或已过期")
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}
