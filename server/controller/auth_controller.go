package controller

import (
	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"
	"campus-second-hand/server/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	JWTSecret      string
	JWTExpireHours int
}

func (a *AuthController) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}

	user, err := service.Register(req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}

	response.Success(c, "注册成功", gin.H{
		"user": user,
	})
}

func (a *AuthController) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}

	user, err := service.Login(req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}

	token, err := utils.GenerateToken(a.JWTSecret, a.JWTExpireHours, user.ID)
	if err != nil {
		response.Fail(c, 500, "生成 Token 失败")
		return
	}

	response.Success(c, "登录成功", gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
			"role":     user.Role,
		},
	})
}
