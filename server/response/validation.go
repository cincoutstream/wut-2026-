package response

import (
	"errors"

	"github.com/go-playground/validator/v10"
)

var validationMessages = map[string]string{
	"RegisterRequest.Username.required":        "请输入用户名",
	"RegisterRequest.Username.min":             "用户名至少 3 个字符",
	"RegisterRequest.Username.max":             "用户名不能超过 50 个字符",
	"RegisterRequest.Password.required":        "请输入密码",
	"RegisterRequest.Password.min":             "密码至少 6 个字符",
	"RegisterRequest.Password.max":             "密码不能超过 50 个字符",
	"RegisterRequest.Nickname.max":             "昵称不能超过 50 个字符",
	"RegisterRequest.Phone.required":           "请输入手机号",
	"RegisterRequest.Phone.len":                "请输入 11 位手机号",
	"RegisterRequest.Phone.numeric":            "手机号只能包含数字",
	"LoginRequest.Username.required":           "请输入用户名",
	"LoginRequest.Password.required":           "请输入密码",
	"CreateProductRequest.Title.required":      "请输入商品标题",
	"CreateProductRequest.Title.max":           "商品标题不能超过 100 个字符",
	"CreateProductRequest.Description.max":     "商品描述不能超过 2000 个字符",
	"CreateProductRequest.Price.required":      "请输入商品价格",
	"CreateProductRequest.Price.gt":            "商品价格必须大于 0",
	"CreateProductRequest.Category.max":        "商品分类不能超过 50 个字符",
	"CreateProductRequest.ImageURL.max":        "商品图片过大，请压缩后重试",
	"UpdateProductRequest.Title.required":      "请输入商品标题",
	"UpdateProductRequest.Title.max":           "商品标题不能超过 100 个字符",
	"UpdateProductRequest.Description.max":     "商品描述不能超过 2000 个字符",
	"UpdateProductRequest.Price.required":      "请输入商品价格",
	"UpdateProductRequest.Price.gt":            "商品价格必须大于 0",
	"UpdateProductRequest.Category.max":        "商品分类不能超过 50 个字符",
	"UpdateProductRequest.ImageURL.max":        "商品图片过大，请压缩后重试",
	"UpdateProductRequest.Status.required":     "请选择商品状态",
	"UpdateProductRequest.Status.oneof":        "商品状态不正确",
	"CreateTransactionRequest.Remark.required": "请填写交易时间、地点或联系方式说明",
	"CreateTransactionRequest.Remark.max":      "交易说明不能超过 500 个字符",
	"CreateMessageRequest.Content.required":    "请输入留言内容",
	"CreateMessageRequest.Content.max":         "留言内容不能超过 500 个字符",
	"CreateMessageRequest.ImageURL.max":        "留言图片过大，请压缩后重试",
	"CreateReviewRequest.Rating.required":      "请选择评分",
	"CreateReviewRequest.Rating.min":           "评分不能低于 1 分",
	"CreateReviewRequest.Rating.max":           "评分不能超过 5 分",
	"CreateReviewRequest.Content.required":     "请输入评价内容",
	"CreateReviewRequest.Content.max":          "评价内容不能超过 500 个字符",
	"CreateReviewRequest.ImageURL.max":         "评价图片过大，请压缩后重试",
	"UpdateReviewRequest.Rating.required":      "请选择评分",
	"UpdateReviewRequest.Rating.min":           "评分不能低于 1 分",
	"UpdateReviewRequest.Rating.max":           "评分不能超过 5 分",
	"UpdateReviewRequest.Content.required":     "请输入评价内容",
	"UpdateReviewRequest.Content.max":          "评价内容不能超过 500 个字符",
	"UpdateReviewRequest.ImageURL.max":         "评价图片过大，请压缩后重试",
	"UpdateProfileRequest.Nickname.max":        "昵称不能超过 50 个字符",
	"UpdateProfileRequest.Phone.required":      "请输入手机号",
	"UpdateProfileRequest.Phone.len":           "请输入 11 位手机号",
	"UpdateProfileRequest.Phone.numeric":       "手机号只能包含数字",
	"UpdateProfileRequest.QQ.max":              "QQ 号不能超过 30 个字符",
	"UpdateProfileRequest.Wechat.max":          "微信号不能超过 80 个字符",
	"UpdateProfileRequest.Avatar.max":          "头像图片过大，请压缩后重试",
}

func ValidationMessage(err error) string {
	var validationErrors validator.ValidationErrors
	if !errors.As(err, &validationErrors) || len(validationErrors) == 0 {
		return err.Error()
	}

	first := validationErrors[0]
	if msg, ok := validationMessages[first.StructNamespace()+"."+first.Tag()]; ok {
		return msg
	}
	if msg, ok := validationMessages[first.StructField()+"."+first.Tag()]; ok {
		return msg
	}
	return "提交信息格式不正确，请检查后重试"
}
