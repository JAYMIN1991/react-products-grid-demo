
// Create a ES6 class component    
class ProductList extends React.Component {
    // Use the render function to return JSX component     
    constructor() {
        super();
    }

    ref = React.createRef();
    state = {
        products: [],
        pagination: {
            page: 1,
            count: 15
        },
        observer: {},
        isLoader: false,
        scrollCount: 0,
        isNextData: true,
        sortBy: ""
    }
    async componentDidMount() {
        let { pagination, sortBy } = this.state;
        await this.setState({ isLoader: true })

        let url = `/products?_page=1&_limit=15${sortBy ? `&_sort=${sortBy}` : ""}`

        fetch(url)
            .then(async (response) => {
                let products = await response.json();
                await this.setState({ products })
            })
            .then(async (data) => {
                /*IntersectionObserver used to observe particular dom base on it. API call will happend 
                It will observe Users activity based on this data will be loaded
                */
                const observer = new IntersectionObserver(async ([entry]) => {

                    let count = entry.target.id.split("@")[1];

                    if (entry.intersectionRatio > 0.15 && this.state.isNextData) {
                        this.setState({ scrollCount: count });
                        let { pagination } = this.state;
                        pagination = {
                            page: pagination.page + 1,
                            count: 15
                        }
                        this.setState({ pagination });
                        await this.setState({ isLoader: true });
                        //Getting next records
                        this.getNextData(pagination.page, pagination.count)
                    }

                }, {
                    root: null,
                    rootMargin: "0px",
                    threshold: 0.25
                })
                this.setState({ observer });
                //It will observe particular dom based on it , it will call API
                if (this.ref.current) {
                    observer.observe(this.ref.current)
                }
            });
    }
    getNextData(page, count) {
        let { sortBy } = this.state;
        // Generating URL based on requirment
        let url = `/products?_page=${page}&_limit=15${sortBy ? `&_sort=${sortBy}` : ""}`
        fetch(url)
            .then(async (response) => {
                let productsRefresh = await response.json();
                if (productsRefresh.length === 0) {
                    this.setState({ isNextData: false, isLoader: false })
                    return;
                }
                let { products } = this.state;
                products = [...products, ...productsRefresh];
                await this.setState({ products })
            })
            .then(async (data) => {

                await this.setState({ isLoader: false });
                //It will observe particular dom based on it , it will call API
                if (this.ref.current) {
                    this.state.observer.observe(this.ref.current)
                }
            });
    }
    dateMaker(date) {
        /**Date maker function if date coming in product is more than 1 week older then it will so date else days ago
         * For today's date it will show today
         * **/
        let today, productDate, timeDifference, dayDifference;
        today = new Date();
        productDate = new Date(date);
        //Getting time difference
        timeDifference = today.getTime() - productDate.getTime();
        // get date difference based on date
        dayDifference = timeDifference / (1000 * 3600 * 24);
        dayDifference = Math.floor(dayDifference);
        return dayDifference === 0 ? "Today" : dayDifference >= 7 ? productDate.toDateString() : `${dayDifference} ${dayDifference === 1 ? "day ago" : "days ago"}`;
    }
    async sortProducts(e) {
        /**
         * Sorting products
         */
        let pagination = {
            page: 1,
            count: 15
        }
        await this.setState({ products: [], sortBy: e.target.value, pagination })
        this.getNextData(pagination.page, pagination.count)
    }
    render() {
        let { products } = this.state;
        return (
            <div className="row">
                <div className="col-lg-12">
                    <label htmlFor="cars">sort:</label>
                    {/* Sorting  */}
                    <select id="cars" className="from-control" onChange={(e) => this.sortProducts(e)}>
                        <option value="">Select</option>
                        <option value="size">Size</option>
                        <option value="price">Price</option>
                        <option value="id">Id</option>
                    </select>
                </div>
                {
                    products.map((el, i) => {
                        // Product listing in grid view
                        return (
                            <div ref={this.ref} id={`observer@${i}`} className={`col-lg-3 col-md-3 col-xs-6 col-sm-6 watch${i}`} key={i}>
                                {i % 20 !== 0 ? <div className="card myowncard">
                                    <div className="card-body" style={{height:`200px`}}>
                                        <p className="card-title" style={{ fontSize: `${el.size}px` }}>{el.face}</p>
                                        <h6 className="card-subtitle mb-2 text-muted">Price: ${el.price}</h6>
                                        <p className="card-text">Date:{el.date}</p>
                                        {this.dateMaker(el.date)}
                                        <div className="spinner-border"></div>
                                    </div>
                                </div> :
                                    <div className="card">
                                        <div className="card-body">
                                            <img className="ad" style={{width:`256px`}} src={`/ads/?r=${Math.floor(Math.random() * 1000)}`} />
                                        </div>
                                    </div>}
                            </div>
                        );
                    })
                }
                {/* Loader */}
                {this.state.isLoader &&
                    <div className="col-lg-12">
                        <div className="text-center">
                            <img src="https://i.gifer.com/4V0b.gif" height="100" width="100"></img>
                        </div>
                    </div>}
                {/* When No data remaining to load */}
                {!this.state.isNextData &&
                    <div className="col-lg-12">
                        <div className="text-center">
                            <p style={{ color: "green" }}>~ end of catalogue ~</p>
                        </div>
                    </div>
                }
            </div>

        );
    }
}
// Create a function to wrap up your component
function App() {
    return (
        <div className="form-group">
            <ProductList />
        </div>
    )
}

// Use the ReactDOM.render to show your component on the browser
ReactDOM.render(
    <App />,
    document.getElementById('app')
);
