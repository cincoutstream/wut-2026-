package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"
	"campus-second-hand/server/utils"
)

func Register(req request.RegisterRequest) (*model.User, error) {
	req.Phone = strings.TrimSpace(req.Phone)

	var existing model.User
	if err := database.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	password, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username: req.Username,
		Password: password,
		Nickname: req.Nickname,
		Phone:    req.Phone,
		Role:     "user",
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func Login(req request.LoginRequest) (*model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return nil, errors.New("用户不存在")
	}
	if !utils.CheckPassword(user.Password, req.Password) {
		return nil, errors.New("密码错误")
	}
	return &user, nil
}
