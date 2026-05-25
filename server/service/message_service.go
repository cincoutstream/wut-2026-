package service

import (
	"errors"
	"strings"

	"campus-second-hand/server/database"
	"campus-second-hand/server/model"
	"campus-second-hand/server/request"

	"gorm.io/gorm"
)

type MessageTree struct {
	ID        uint          `json:"id"`
	ProductID uint          `json:"productId"`
	UserID    uint          `json:"userId"`
	User      model.User    `json:"user"`
	ParentID  *uint         `json:"parentId"`
	Content   string        `json:"content"`
	ImageURL  string        `json:"imageUrl"`
	IsDeleted bool          `json:"isDeleted"`
	CreatedAt interface{}   `json:"createdAt"`
	Replies   []MessageTree `json:"replies"`
}

func CreateMessage(userID, productID uint, req request.CreateMessageRequest, parentID *uint) (*model.Message, error) {
	if _, err := GetProductByID(productID); err != nil {
		return nil, err
	}
	content := strings.TrimSpace(req.Content)
	if content == "" {
		return nil, errors.New("请输入留言内容")
	}

	if parentID != nil {
		var parent model.Message
		if err := database.DB.Where("id = ? AND product_id = ? AND is_deleted = ?", *parentID, productID, false).First(&parent).Error; err != nil {
			return nil, errors.New("回复的留言不存在")
		}
	}

	message := &model.Message{
		ProductID: productID,
		UserID:    userID,
		ParentID:  parentID,
		Content:   content,
		ImageURL:  req.ImageURL,
	}
	if err := database.DB.Create(message).Error; err != nil {
		return nil, err
	}

	return GetMessageByID(message.ID)
}

func GetMessageByID(id uint) (*model.Message, error) {
	var message model.Message
	if err := database.DB.Preload("User").First(&message, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("留言不存在")
		}
		return nil, err
	}
	return &message, nil
}

func ListMessages(productID uint) ([]MessageTree, error) {
	var messages []model.Message
	if err := database.DB.Preload("User").Where("product_id = ? AND is_deleted = ?", productID, false).Order("created_at asc").Find(&messages).Error; err != nil {
		return nil, err
	}

	type node struct {
		MessageTree
		children []*node
	}

	nodeMap := make(map[uint]*node)
	roots := make([]*node, 0)

	for _, msg := range messages {
		nodeMap[msg.ID] = &node{
			MessageTree: MessageTree{
				ID:        msg.ID,
				ProductID: msg.ProductID,
				UserID:    msg.UserID,
				User:      msg.User,
				ParentID:  msg.ParentID,
				Content:   msg.Content,
				ImageURL:  msg.ImageURL,
				IsDeleted: msg.IsDeleted,
				CreatedAt: msg.CreatedAt,
				Replies:   []MessageTree{},
			},
			children: []*node{},
		}
	}

	for _, msg := range messages {
		current := nodeMap[msg.ID]
		if msg.ParentID == nil {
			roots = append(roots, current)
			continue
		}
		parent, ok := nodeMap[*msg.ParentID]
		if !ok {
			roots = append(roots, current)
			continue
		}
		parent.children = append(parent.children, current)
	}

	var buildTree func(*node) MessageTree
	buildTree = func(current *node) MessageTree {
		replies := make([]MessageTree, 0, len(current.children))
		for _, child := range current.children {
			replies = append(replies, buildTree(child))
		}
		current.MessageTree.Replies = replies
		return current.MessageTree
	}

	result := make([]MessageTree, 0, len(roots))
	for _, root := range roots {
		result = append(result, buildTree(root))
	}

	return result, nil
}

func DeleteMessage(userID, messageID uint) error {
	message, err := GetMessageByID(messageID)
	if err != nil {
		return err
	}
	if message.UserID != userID {
		return errors.New("只能删除自己的留言")
	}
	return database.DB.Model(&model.Message{}).Where("id = ?", messageID).Updates(map[string]interface{}{
		"is_deleted": true,
		"content":    "该留言已删除",
		"image_url":  "",
	}).Error
}
