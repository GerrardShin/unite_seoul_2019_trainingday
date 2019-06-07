
namespace game
{
    /** New System */
    export class PlayerCollisionSystem extends ut.ComponentSystem
	{
		static explosionGroupName : string = "game.ExplosionGroup"; // 충돌시 폭파, static임

        OnUpdate():void
		{
			let isGameOver = false; // 게임오버 flag

            // 충돌 확인
			this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.HitBox2D.HitBoxOverlapResults, game.PlayerTag], (entity, position, contacts, tag) =>
			{
                //let explosion = ut.EntityGroup.instantiate(this.world, game.PlayerCollisionSystem.explosionGroupName)[0];
                // 폭발 스프라이트 등 받아와 생성
				let explosion = ut.EntityGroup.instantiate(this.world, game.GameService.explosionGroup)[0];

                // usingComponentData로 플레이어 위치 받아와 (이 엔티티에 있는 다른 컴포넌트를 받아와야함, 왜냐면 ECS는 필요없는 정보는 전부 버리기 때문에 따로 받아온다고 선언해야함)
				this.world.usingComponentData(explosion, [ut.Core2D.TransformLocalPosition], (explosionPos) =>
				{
                    explosionPos.position = position.position;
                });

				this.world.destroyEntity(entity);

				isGameOver = true;

			});

			if(isGameOver)
				game.GameService.restart(this.world); // GameService = static 클래스
        }
    }
}
