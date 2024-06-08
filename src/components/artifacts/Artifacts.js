
export const Artifact = ({ artifact: a }) => {
  console.log(a)

  return a && (
    <div>
      Artifact {a.name}
      <div>
        {a.culture}
      </div>
    </div>
  )
}