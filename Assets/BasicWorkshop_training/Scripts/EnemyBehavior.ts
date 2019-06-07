
namespace game 
{
    /** New Filter */
    export class EnemyBehaviorFilter extends ut.EntityFilter // 설정값 받아와서 entity list 가지고 있음
	{
        entity: ut.Entity;
        position: ut.Core2D.TransformLocalPosition;
		tag: game.EnemyTag;
		speed: game.MoveSpeed;
		speedChange: game.ChangeOverTime;
		bounds: game.Boundaries;
    }

    /** New Behaviour */
    export class EnemyBehavior extends ut.ComponentBehaviour  // monobehavior 과 비슷, event loop(onenable, update, ondestroy) 비슷한거 이용
	{

        data: EnemyBehaviorFilter; // tiny 와 behaviorfilter는 별개

        OnEntityEnable():void 
		{
            let totalTime = ut.Time.time();
			let newSpeed = this.data.speed.speed + (this.data.speedChange.changePerSecond * totalTime);
			
			this.data.speed.speed = newSpeed;
			
			let randomX = getRandom(this.data.bounds.minX, this.data.bounds.maxX);
			let newPos = new Vector3(randomX, this.data.bounds.maxY, 0);
			
			this.data.position.position = newPos;

			console.log("enemy initialized. Speed: " + newSpeed); // 브라우저의 로그에서 확인 가능, 기능들이 각각 entity 마다 수행됨
        }
        
        OnEntityUpdate():void 
		{
            let localPosition = this.data.position.position;
			localPosition.y -= this.data.speed.speed * ut.Time.deltaTime();

			this.data.position.position = localPosition;

			if(localPosition.y <= this.data.bounds.minY)	
				//this.world.addComponent(this.entity, ut.Disabled);
				this.world.destroyEntity(this.data.entity);
        }
    }

	function getRandom(min, max) 
	{
		return Math.random() * (max - min + 1) + min;
	}
}
