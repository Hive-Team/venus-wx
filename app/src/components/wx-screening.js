var React = require('react');
var Router = require('react-router-ie8');

var WXScreening = React.createClass({

    componentDidMount: function() {
        var stly_b = false;
        var $btn_style = $('#btn_style');
        var $style_box = $('#style_box');

        $btn_style.bind('click',function(){
            if(stly_b){
                stly_b = !stly_b;
                $style_box.animate({height:0});
            }else{
                stly_b = !stly_b;
                $style_box.animate({height:$('li',$style_box).length * 31 + 1});
            }
        });
    },


    render: function() {
        var styles = this.props.styles;
        var onclick = this.props.onclick;

        return (
            <div className="screening-view screening-box">
                <ul className="screening-list" id="style_box">
                    <li onClick={self.selStyle.bind(self,'')}>全部风格作品</li>
                    {
                        $.map(styles,function(v,i){
                            return (
                                <li key={i} onClick={onclick.bind(self,v.styleId)}>{v.styleName}</li>
                            )
                        })
                    }
                </ul>
                <div className="btn-box" id="btn_style">
                    <span className="btn">风格</span>
                </div>
            </div>
        );
    }

});

module.exports = WXScreening;
