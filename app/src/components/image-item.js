var React = require('react');
var PropTypes = React.PropTypes;

/** @namespace this.props.contentId */
var ImageListItem = React.createClass({
    propTypes:{
        detailBaseUrl:PropTypes.string,
        url:PropTypes.string,
        frameWidth:PropTypes.number,
        frameHeight:PropTypes.number,
        sid:PropTypes.number,
        errorUrl:PropTypes.string,
        detailUrl:PropTypes.string
    },

    render: function() {
        // url with width and height
        // someurl_100x1200.*g
        var reg = /_(\d{1,4})x(\d{1,4})\.\w+g$/i;
        // 在线上环境, 就依靠oss服务裁剪图片. 要加水印也可以. 默认不加.
        var scaleW = (this.props.frameWidth)? this.props.frameWidth+'w_':'';
        var scaleH = (this.props.frameHeight)? this.props.frameHeight+'h_':'';
        var water = this.props.mask === true ?'|watermark=1&object=c2h1aXlpbi5wbmc&t=60&p=5&y=10&x=10':'';
        var url = /*(window.Core.mode === 'dev') ? this.props.url + '@' + water : */this.props.url ;// + '@' + scaleW + scaleH + '90Q' + water;

        var found = this.props.url && this.props.url.match(reg);
        var width = -1;
        var height = -1;

        if(found&&found.length === 3){
            //如果图片带了高宽参数 就截取出来.放在data-x属性上.方便操作
            width = parseInt(found[1]);
            height = parseInt(found[2]);
        }

        var detailUrl = this.props.detailBaseUrl ? '#/'+this.props.detailBaseUrl+'/'+this.props.sid : 'javascript:void(0)';
        //console.log(this.props.sid);

        return (
            <a href={detailUrl} style={{textAlign:'center',backgroundColor:'#fefefe'}} className="img-box" ref='RImageItem' data-width={width} data-height={height}>
                <img src={url} onerror={this.props.errorUrl}/>
            </a>
        );
    }

});

module.exports = ImageListItem;
