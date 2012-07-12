class ClipActionOffsetEnd < ClipAction

  field :offset, :type => Float
  field :old_offset, :type => Float

  def redo
    self.update_attributes!(:old_offset => clip.end_offset)
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    } << self
    clip.update_attributes!(:end_offset => offset)
  end

  def undo
    clip.track.song_version.root_action.children.find { |a| 
      a.name == "track_action_create_#{clip.track.id}"
    }.children.find { |a|
      a.name == "clip_action_create_#{clip.id}"
    }.remove_child!(self)
    clip.update_attributes!(:end_offset => old_offset)

    # undoing children (dependant actions)
    children.each &:undo
  end
end