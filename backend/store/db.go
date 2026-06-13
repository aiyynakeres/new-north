package store

import (
	"context"
	"embed"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrations embed.FS

type DB struct {
	Pool *pgxpool.Pool
}

func NewDB(ctx context.Context, databaseURL string) (*DB, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	return &DB{Pool: pool}, nil
}

func (db *DB) Migrate(ctx context.Context) error {
	sql, err := migrations.ReadFile("migrations/001_init.sql")
	if err != nil {
		return fmt.Errorf("unable to read migration: %w", err)
	}

	if _, err := db.Pool.Exec(ctx, string(sql)); err != nil {
		return fmt.Errorf("unable to run migration: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func (db *DB) Close() {
	if db.Pool != nil {
		db.Pool.Close()
	}
}
