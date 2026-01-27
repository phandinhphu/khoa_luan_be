class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1. Advanced filtering (gt, gte, lt, lte, regex)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|regex)\b/g, match => `$${match}`);

        // Parse lại JSON
        const parsedQuery = JSON.parse(queryStr);

        // Xử lý đặc biệt cho regex để search không phân biệt hoa thường (option 'i')
        // Lưu ý: Client gửi lên dạng ?title[regex]=abc
        // Code trên đã chuyển thành { title: { $regex: 'abc' } }
        // Cần thêm { $options: 'i' } nếu muốn case-insensitive.
        // Tuy nhiên, để đơn giản và generic, ta có thể duyệt qua parsedQuery

        for (const key in parsedQuery) {
            if (parsedQuery[key]['$regex']) {
                parsedQuery[key]['$options'] = 'i';
            }
        }

        this.query = this.query.find(parsedQuery);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
