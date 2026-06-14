# Menggunakan image Node.js versi ringan
FROM node:18-alpine

# Menentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin file package.json dan menginstal dependencies
COPY package*.json ./
RUN npm install

# Menyalin seluruh source code proyek
COPY . .

# Membuka port 3000
EXPOSE 3000