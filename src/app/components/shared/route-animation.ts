import {
  transition,
  trigger,
  query,
  style,
  animate,
  group,
  animateChild
} from '@angular/animations';

const animationDuration = "0.4s ease"

export const slideInAnimation =
  trigger('routeAnimations', [
       transition('1 => *, 2 => 3, 2 => 4, 3 => 4', getSlideAnimation("left")),
       transition('4 => *, 3 => 2, 2 => 1, 3 => 1', getSlideAnimation("right")),
]);

function getSlideAnimation(direction: string){
  if(!(document.body.offsetWidth < 750)) return []

  if(direction.match("left")){
    return [
      query(':enter, :leave',
           style({ position: 'fixed',  width: '100%'}),
           { optional: true }),
      group([
           query(':enter', [
               style({ transform: 'translateX(100%)' }),
               animate(animationDuration,
               style({ transform: 'translateX(0%)' }))
           ], { optional: true }),
           query(':leave', [
               style({ transform: 'translateX(0%)' }),
               animate(animationDuration,
               style({ transform: 'translateX(-100%)' }))
               ], { optional: true }),
       ])
      ]
  }
  return [
    query(':enter, :leave',
        style({ position: 'fixed', width: '100%'}),
        { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate(animationDuration,
            style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
              style({ transform: 'translateX(0%)' }),
              animate(animationDuration,
              style({ transform: 'translateX(100%)' })
        )], { optional: true }),
    ])
  ]
}
