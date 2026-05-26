package router

import (
	"campus-second-hand/server/config"
	"campus-second-hand/server/controller"
	"campus-second-hand/server/middleware"
	"campus-second-hand/server/response"

	"github.com/gin-gonic/gin"
)

func Setup(cfg *config.AppConfig) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())
	r.Use(middleware.RequestMetrics())

	authController := &controller.AuthController{
		JWTSecret:      cfg.JWT.Secret,
		JWTExpireHours: cfg.JWT.ExpireHours,
	}
	userController := &controller.UserController{}
	productController := &controller.ProductController{}
	transactionController := &controller.TransactionController{}
	messageController := &controller.MessageController{}
	reviewController := &controller.ReviewController{}

	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			response.Success(c, "ok", gin.H{"service": "campus-second-hand"})
		})

		api.POST("/auth/register", authController.Register)
		api.POST("/auth/login", authController.Login)
		api.GET("/products", productController.List)
		api.GET("/products/:productId", productController.Detail)
		api.GET("/products/:productId/messages", messageController.List)
		api.GET("/products/:productId/reviews", reviewController.ListByProduct)
		api.GET("/users/:userId/reviews", reviewController.ListByUser)
	}

	authAPI := api.Group("")
	authAPI.Use(middleware.Auth(cfg.JWT.Secret))
	{
		authAPI.GET("/user/profile", userController.Profile)
		authAPI.PUT("/user/profile", userController.UpdateProfile)

		authAPI.POST("/products", productController.Create)
		authAPI.PUT("/products/:productId", productController.Update)
		authAPI.GET("/my/products", productController.MyProducts)
		authAPI.PUT("/products/:productId/off-shelf", productController.OffShelf)

		authAPI.POST("/products/:productId/transactions", transactionController.Create)
		authAPI.GET("/my/buy-transactions", transactionController.BuyList)
		authAPI.GET("/my/sell-transactions", transactionController.SellList)
		authAPI.PUT("/transactions/:transactionId/accept", transactionController.Accept)
		authAPI.PUT("/transactions/:transactionId/reject", transactionController.Reject)
		authAPI.PUT("/transactions/:transactionId/complete", transactionController.Complete)

		authAPI.POST("/products/:productId/messages", messageController.Create)
		authAPI.POST("/products/:productId/messages/:messageId/replies", messageController.Reply)
		authAPI.DELETE("/messages/:messageId", messageController.Delete)

		authAPI.POST("/transactions/:transactionId/reviews", reviewController.Create)
		authAPI.PUT("/reviews/:reviewId", reviewController.Update)
	}

	return r
}
