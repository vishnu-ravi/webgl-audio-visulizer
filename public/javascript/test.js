var scene, camera, renderer, container, controls;
var SCREEN_WIDTH, SCREEN_HEIGHT;

var Webgl   =   function(){}

Webgl.prototype.init    =   function () {
    var distance    =   100;
    container       =   document.getElementById('container');
    container.style.color   =   '#fff';
    container.style.font    =   '13px/20px Arial, sans-serif';

    SCREEN_WIDTH    =   container.offsetWidth || window.innerWidth;
    SCREEN_HEIGHT   =   container.offsetHeight || window.innerHeight;
    scene           =   new THREE.Scene();
    camera          =   new THREE.PerspectiveCamera(70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);

    camera.position.z   =   400;
    camera.target       =   new THREE.Vector3( 0, 0, 0 );
    scene.add(camera);

    renderer        =   new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    controls        =   new THREE.OrbitControls(camera, renderer.domElement);

    var loader      =   new THREE.OBJLoader();
    var texture     =   THREE.ImageUtils.loadTexture('/image/sample2.png');
    loader.load('/models/head_2.obj', function(object) {
        var material    =    new THREE.MeshBasicMaterial({map: texture});
        console.log(object);
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
        object.scale.x    =   object.scale.y    =   object.scale.z = 50;
        object.position.x    =   object.position.z = 0;
        object.position.y   =   -400;
        head    =   object;
        scene.add(object);
    });

    renderer.autoClear  =   false;
    renderer.setClearColor(0xffffff, 0.0);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    container.appendChild(renderer.domElement);
    function animate() {
		requestAnimationFrame( animate );
		render();
	}

    function render() {
        renderer.clear();
		renderer.render( scene, camera );
    }

    animate();
};

var webgl           =   new Webgl();
window.onload       =   function() {
    document.body.style.backgroundImage	=	'none';
    webgl.init();
};
