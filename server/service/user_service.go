package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"
)

func GetUserByID(userID uint) (*model.User, error) {
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}
	return &user, nil
}

func UpdateProfile(userID uint, req request.UpdateProfileRequest) (*model.User, error) {
	user, err := GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	user.Nickname = req.Nickname
	user.Phone = strings.TrimSpace(req.Phone)
	user.Avatar = req.Avatar

	if err := database.DB.Save(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}
