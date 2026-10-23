-- Enable PostGIS extension for spherical earth distance queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- AlterTable: add nullable latitude and longitude columns to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "latitude"  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
