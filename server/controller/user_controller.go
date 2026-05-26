package controller

import (
	"campus-second-hand/server/request"
	"campus-second-hand/server/response"
	"campus-second-hand/server/service"

	"github.com/gin-gonic/gin"
)

type UserController struct{}

func (u *UserController) Profile(c *gin.Context) {
	userID := c.GetUint("userID")
	user, err := service.GetUserByID(userID)
	if err != nil {
		response.Fail(c, 404, err.Error())
		return
	}
	response.Success(c, "查询成功", user)
}

func (u *UserController) UpdateProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, 400, response.ValidationMessage(err))
		return
	}
	user, err := service.UpdateProfile(userID, req)
	if err != nil {
		response.Fail(c, 400, err.Error())
		return
	}
	response.Success(c, "更新成功", user)
}
