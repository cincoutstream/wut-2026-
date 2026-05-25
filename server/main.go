package main

import (
	"fmt"
	"log"

	"campus-second-hand/server/config"
	"campus-second-hand/server/database"
	"campus-second-hand/server/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config failed: %v", err)
	}

	if err := database.Init(cfg); err != nil {
		log.Fatalf("init database failed: %v", err)
	}

	r := router.Setup(cfg)
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("server started at http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("run server failed: %v", err)
	}
}
