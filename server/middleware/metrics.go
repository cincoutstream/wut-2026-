package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestMetrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Set("requestStart", start)
		c.Next()

		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		log.Printf("[API] %s %s %d %.2fms",
			c.Request.Method,
			path,
			c.Writer.Status(),
			float64(time.Since(start).Microseconds())/1000,
		)
	}
}
