FROM golang:1.18-alpine as builder

WORKDIR /go/src

COPY ./../../ ./

WORKDIR /go/src/sample/server

RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/go/pkg \
  sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  # && apk --update add --no-cache make  \
  && go env -w GOPROXY=https://goproxy.cn,https://mirrors.aliyun.com/goproxy,direct \
  && CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build \
  -o /go/bin/main \
  -ldflags '-s -w'

FROM alpine as runner

COPY --from=builder /go/bin/main /app/main

EXPOSE 8080
EXPOSE 50051

ENTRYPOINT ["/app/main"]
