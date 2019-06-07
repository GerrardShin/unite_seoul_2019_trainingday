var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var game;
(function (game) {
    /** New Filter */
    var EnemyBehaviorFilter = /** @class */ (function (_super) {
        __extends(EnemyBehaviorFilter, _super); // 설정값 받아와서 entity list 가지고 있음
        function EnemyBehaviorFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return EnemyBehaviorFilter;
    }(ut.EntityFilter // 설정값 받아와서 entity list 가지고 있음
    ));
    game.EnemyBehaviorFilter = EnemyBehaviorFilter;
    /** New Behaviour */
    var EnemyBehavior = /** @class */ (function (_super) {
        __extends(EnemyBehavior, _super); // monobehavior 과 비슷, event loop(onenable, update, ondestroy) 비슷한거 이용
        function EnemyBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EnemyBehavior.prototype.OnEntityEnable = function () {
            var totalTime = ut.Time.time();
            var newSpeed = this.data.speed.speed + (this.data.speedChange.changePerSecond * totalTime);
            this.data.speed.speed = newSpeed;
            var randomX = getRandom(this.data.bounds.minX, this.data.bounds.maxX);
            var newPos = new Vector3(randomX, this.data.bounds.maxY, 0);
            this.data.position.position = newPos;
            console.log("enemy initialized. Speed: " + newSpeed); // 브라우저의 로그에서 확인 가능, 기능들이 각각 entity 마다 수행됨
        };
        EnemyBehavior.prototype.OnEntityUpdate = function () {
            var localPosition = this.data.position.position;
            localPosition.y -= this.data.speed.speed * ut.Time.deltaTime();
            this.data.position.position = localPosition;
            if (localPosition.y <= this.data.bounds.minY)
                //this.world.addComponent(this.entity, ut.Disabled);
                this.world.destroyEntity(this.data.entity);
        };
        return EnemyBehavior;
    }(ut.ComponentBehaviour // monobehavior 과 비슷, event loop(onenable, update, ondestroy) 비슷한거 이용
    ));
    game.EnemyBehavior = EnemyBehavior;
    function getRandom(min, max) {
        return Math.random() * (max - min + 1) + min;
    }
})(game || (game = {}));
var game;
(function (game) {
    var GameService = /** @class */ (function () {
        function GameService() {
        }
        GameService.restart = function (world) {
            // return; //Uncomment this line if you don't want the game to restart
            var _this = this;
            setTimeout(function () {
                _this.newGame(world);
            }, 3000);
        };
        ;
        GameService.newGame = function (world) {
            ut.Time.reset();
            ut.EntityGroup.destroyAll(world, this.mainGroup);
            ut.EntityGroup.destroyAll(world, this.enemyGroup);
            ut.EntityGroup.destroyAll(world, this.explosionGroup);
            ut.EntityGroup.instantiate(world, this.mainGroup);
        };
        ;
        GameService.mainGroup = 'game.MainGroup';
        GameService.enemyGroup = 'game.EnemyGroup';
        GameService.explosionGroup = 'game.ExplosionGroup';
        return GameService;
    }());
    game.GameService = GameService;
})(game || (game = {}));
var game;
(function (game) {
    /** New System */
    var InputMovementSystem = /** @class */ (function (_super) {
        __extends(InputMovementSystem, _super);
        // inputmovementsystem 노출, utiny componentsystem 상속
        function InputMovementSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // 필수구현
        InputMovementSystem.prototype.OnUpdate = function () {
            var _this = this;
            var dt = ut.Time.deltaTime(); // 시간차 받아옴
            // ecs system의 world = ecs system 관장함, 아래의 것들을 받아온다
            this.world.forEach([game.MoveSpeed, game.MoveWithInput, game.Boundaries, ut.Core2D.TransformLocalPosition], function (speed, tag, bounds, position) {
                var localPosition = position.position; // 현재위치 받아옴
                // tiny 모듈로 키 인식해서 속도 ++
                if (ut.Runtime.Input.getKey(ut.Core2D.KeyCode.W))
                    localPosition.y += speed.speed * dt;
                if (ut.Runtime.Input.getKey(ut.Core2D.KeyCode.S))
                    localPosition.y -= speed.speed * dt;
                if (ut.Runtime.Input.getKey(ut.Core2D.KeyCode.A))
                    localPosition.x -= speed.speed * dt;
                if (ut.Runtime.Input.getKey(ut.Core2D.KeyCode.D))
                    localPosition.x += speed.speed * dt;
                _this.ProcessTouchInput(localPosition, speed.speed * dt);
                localPosition.x = Math.max(bounds.minX, Math.min(bounds.maxX, localPosition.x));
                localPosition.y = Math.max(bounds.minY, Math.min(bounds.maxY, localPosition.y));
                position.position = localPosition;
            });
        };
        InputMovementSystem.prototype.ProcessTouchInput = function (position, speed) {
            if (ut.Core2D.Input.isTouchSupported()) {
                if (ut.Core2D.Input.touchCount() > 0) {
                    var touch = ut.Core2D.Input.getTouch(0);
                    var player = this.world.getEntityByName("Player");
                    var playerWorldPos = ut.Core2D.TransformService.computeWorldPosition(this.world, player);
                    var transPos = ut.Core2D.TransformService.worldToWindow(this.world, this.world.getEntityByName("Camera"), playerWorldPos, new Vector2(600, 800));
                    if (touch.x >= transPos.x) {
                        position.x += speed;
                    }
                    else if (touch.x < transPos.x) {
                        position.x -= speed;
                    }
                    if (touch.y >= transPos.y) {
                        position.y += speed;
                    }
                    else if (touch.y < transPos.y) {
                        position.y -= speed;
                    }
                    if (touch.phase == ut.Core2D.TouchState.Moved) {
                        //console.log("moved: " + ut.Core2D.Input.touchCount());
                    }
                    else if (touch.phase == ut.Core2D.TouchState.Ended) {
                        //console.log("ended: " + ut.Core2D.Input.touchCount());
                    }
                    else if (touch.phase == ut.Core2D.TouchState.Stationary) {
                        //console.log("holding: " + ut.Core2D.Input.touchCount());
                    }
                    else if (touch.phase == ut.Core2D.TouchState.Canceled) {
                        //console.log("cancelled: " + ut.Core2D.Input.touchCount());
                    }
                    else if (touch.phase == ut.Core2D.TouchState.Began) {
                        //console.log("began: " + ut.Core2D.Input.touchCount());
                    }
                    else {
                        console.log("NO TOUCH STATE!!!");
                    }
                }
            }
            else {
                //console.log("TOUCH IS DISABLED!!!");
            }
        };
        InputMovementSystem = __decorate([
            ut.executeAfter(ut.Shared.InputFence) // ut = unity tiny namespace executeAfter -> 조작순서 설정 InputFence 이후에 이 시스템이 동작하도록 함 built-in fence
            // inputmovementsystem 노출, utiny componentsystem 상속
        ], InputMovementSystem);
        return InputMovementSystem;
    }(ut.ComponentSystem));
    game.InputMovementSystem = InputMovementSystem;
})(game || (game = {}));
var game;
(function (game) {
    /** New System */
    var PlayerCollisionSystem = /** @class */ (function (_super) {
        __extends(PlayerCollisionSystem, _super);
        function PlayerCollisionSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PlayerCollisionSystem.prototype.OnUpdate = function () {
            var _this = this;
            var isGameOver = false; // 게임오버 flag
            // 충돌 확인
            this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.HitBox2D.HitBoxOverlapResults, game.PlayerTag], function (entity, position, contacts, tag) {
                //let explosion = ut.EntityGroup.instantiate(this.world, game.PlayerCollisionSystem.explosionGroupName)[0];
                // 폭발 스프라이트 등 받아와 생성
                var explosion = ut.EntityGroup.instantiate(_this.world, game.GameService.explosionGroup)[0];
                // usingComponentData로 플레이어 위치 받아와 (이 엔티티에 있는 다른 컴포넌트를 받아와야함, 왜냐면 ECS는 필요없는 정보는 전부 버리기 때문에 따로 받아온다고 선언해야함)
                _this.world.usingComponentData(explosion, [ut.Core2D.TransformLocalPosition], function (explosionPos) {
                    explosionPos.position = position.position;
                });
                _this.world.destroyEntity(entity);
                isGameOver = true;
            });
            if (isGameOver)
                game.GameService.restart(this.world); // GameService = static 클래스
        };
        PlayerCollisionSystem.explosionGroupName = "game.ExplosionGroup"; // 충돌시 폭파, static임
        return PlayerCollisionSystem;
    }(ut.ComponentSystem));
    game.PlayerCollisionSystem = PlayerCollisionSystem;
})(game || (game = {}));
var game;
(function (game) {
    /** New System */
    var ScrollingBackgroundSystem = /** @class */ (function (_super) {
        __extends(ScrollingBackgroundSystem, _super);
        function ScrollingBackgroundSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScrollingBackgroundSystem.prototype.OnUpdate = function () {
            var dt = ut.Time.deltaTime();
            this.world.forEach([ut.Core2D.TransformLocalPosition, game.ScrollingBackground], function (position, scrolling) {
                var localPosition = position.position;
                localPosition.y -= scrolling.speed * dt;
                if (localPosition.y < scrolling.threshold)
                    localPosition.y += scrolling.distance;
                position.position = localPosition;
            });
        };
        return ScrollingBackgroundSystem;
    }(ut.ComponentSystem));
    game.ScrollingBackgroundSystem = ScrollingBackgroundSystem;
})(game || (game = {}));
var game;
(function (game) {
    /** New System */
    var SpawnSystem = /** @class */ (function (_super) {
        __extends(SpawnSystem, _super);
        function SpawnSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpawnSystem.prototype.OnUpdate = function () {
            var _this = this;
            this.world.forEach([game.Spawner], function (spawner) {
                if (spawner.isPaused)
                    return;
                var time = spawner.time;
                var delay = spawner.delay;
                time -= ut.Time.deltaTime();
                if (time <= 0) {
                    time += delay;
                    ut.EntityGroup.instantiate(_this.world, spawner.spawnGroup);
                }
                spawner.time = time;
            });
        };
        return SpawnSystem;
    }(ut.ComponentSystem));
    game.SpawnSystem = SpawnSystem;
})(game || (game = {}));
var ut;
(function (ut) {
    /**
     * Placeholder system to provide a UnityEngine.Time like API
     *
     * e.g.
     *  let deltaTime = ut.Time.deltaTime();
     *  let time = ut.Time.time();
     *
     */
    var Time = /** @class */ (function (_super) {
        __extends(Time, _super);
        function Time() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Time_1 = Time;
        Time.deltaTime = function () {
            return Time_1._deltaTime;
        };
        Time.time = function () {
            return Time_1._time;
        };
        Time.reset = function () {
            Time_1._time = 0;
        };
        Time.prototype.OnUpdate = function () {
            var dt = this.scheduler.deltaTime();
            Time_1._deltaTime = dt;
            Time_1._time += dt;
        };
        var Time_1;
        Time._deltaTime = 0;
        Time._time = 0;
        Time = Time_1 = __decorate([
            ut.executeBefore(ut.Shared.UserCodeStart)
        ], Time);
        return Time;
    }(ut.ComponentSystem));
    ut.Time = Time;
})(ut || (ut = {}));
var ut;
(function (ut) {
    var EntityGroup = /** @class */ (function () {
        function EntityGroup() {
        }
        /**
         * @method
         * @desc Creates a new instance of the given entity group by name and returns all entities
         * @param {ut.World} world - The world to add to
         * @param {string} name - The fully qualified name of the entity group
         * @returns Flat list of all created entities
         */
        EntityGroup.instantiate = function (world, name) {
            var data = this.getEntityGroupData(name);
            if (data == undefined)
                throw "ut.EntityGroup.instantiate: No 'EntityGroup' was found with the name '" + name + "'";
            return data.load(world);
        };
        ;
        /**
         * @method
         * @desc Destroys all entities that were instantated with the given group name
         * @param {ut.World} world - The world to destroy from
         * @param {string} name - The fully qualified name of the entity group
         */
        EntityGroup.destroyAll = function (world, name) {
            var type = this.getEntityGroupData(name).Component;
            world.forEach([ut.Entity, type], function (entity, instance) {
                // @TODO This should REALLY not be necessary
                // We are protecting against duplicate calls to `destroyAllEntityGroups` within an iteration
                if (world.exists(entity)) {
                    world.destroyEntity(entity);
                }
            });
        };
        /**
         * @method
         * @desc Returns an entity group object by name
         * @param {string} name - Fully qualified group name
         */
        EntityGroup.getEntityGroupData = function (name) {
            var parts = name.split('.');
            if (parts.length < 2)
                throw "ut.Streaming.StreamingService.getEntityGroupData: name entry is invalid";
            var shiftedParts = parts.shift();
            var initialData = entities[shiftedParts];
            if (initialData == undefined)
                throw "ut.Streaming.StreamingService.getEntityGroupData: name entry is invalid";
            return parts.reduce(function (v, p) {
                return v[p];
            }, initialData);
        };
        return EntityGroup;
    }());
    ut.EntityGroup = EntityGroup;
})(ut || (ut = {}));
var ut;
(function (ut) {
    var EntityLookupCache = /** @class */ (function () {
        function EntityLookupCache() {
        }
        EntityLookupCache.getByName = function (world, name) {
            var entity;
            if (name in this._cache) {
                entity = this._cache[name];
                if (world.exists(entity))
                    return entity;
            }
            entity = world.getEntityByName(name);
            this._cache[name] = entity;
            return entity;
        };
        EntityLookupCache._cache = {};
        return EntityLookupCache;
    }());
    ut.EntityLookupCache = EntityLookupCache;
})(ut || (ut = {}));
//# sourceMappingURL=tsc-emit.js.map