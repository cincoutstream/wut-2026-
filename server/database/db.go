package database

import (
	"fmt"
	"log"

	"campus-second-hand/server/config"
	"campus-second-hand/server/model"
	"campus-second-hand/server/utils"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.AppConfig) error {
	var (
		db  *gorm.DB
		err error
	)

	gormCfg := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if cfg.MySQL.Driver == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
			cfg.MySQL.Username,
			cfg.MySQL.Password,
			cfg.MySQL.Host,
			cfg.MySQL.Port,
			cfg.MySQL.Database,
			cfg.MySQL.Charset,
		)
		db, err = gorm.Open(mysql.Open(dsn), gormCfg)
	} else {
		db, err = gorm.Open(sqlite.Open(cfg.MySQL.Path), gormCfg)
	}
	if err != nil {
		return err
	}

	DB = db
	if err := DB.AutoMigrate(
		&model.User{},
		&model.Product{},
		&model.Transaction{},
		&model.Message{},
		&model.Review{},
		&model.Notification{},
	); err != nil {
		return err
	}

	if err := migrateColumnTypes(cfg); err != nil {
		return err
	}

	return seed()
}

func migrateColumnTypes(cfg *config.AppConfig) error {
	if cfg.MySQL.Driver != "mysql" {
		return nil
	}

	if err := DB.Migrator().AlterColumn(&model.User{}, "Avatar"); err != nil {
		return err
	}
	if err := DB.Migrator().AlterColumn(&model.User{}, "QQ"); err != nil {
		return err
	}
	return DB.Migrator().AlterColumn(&model.User{}, "Wechat")
}

func seed() error {
	var count int64
	if err := DB.Model(&model.User{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	password, err := utils.HashPassword("123456")
	if err != nil {
		return err
	}

	users := []model.User{
		{Username: "seller01", Password: password, Nickname: "卖家同学", Phone: "13800000001"},
		{Username: "buyer01", Password: password, Nickname: "买家同学", Phone: "13800000002"},
	}
	if err := DB.Create(&users).Error; err != nil {
		return err
	}

	products := []model.Product{
		{
			UserID:      users[0].ID,
			Title:       "二手高数教材",
			Description: "书况良好，适合大一新生复习使用。",
			Price:       25,
			Category:    "教材",
			ImageURL:    "https://images.unsplash.com/photo-1512820790803-83ca734da794",
			Status:      model.ProductStatusAvailable,
		},
		{
			UserID:      users[0].ID,
			Title:       "九成新机械键盘",
			Description: "青轴，带原装数据线，宿舍自提。",
			Price:       88,
			Category:    "电子产品",
			ImageURL:    "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
			Status:      model.ProductStatusAvailable,
		},
	}

	if err := DB.Create(&products).Error; err != nil {
		return err
	}

	log.Println("seed data initialized: seller01 / buyer01, password 123456")
	return nil
}
